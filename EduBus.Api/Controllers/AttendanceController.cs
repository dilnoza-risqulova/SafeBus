using EduBus.Api.Hubs;
using EduBus.Api.Models;
using EduBus.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Text.Json;

namespace EduBus.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AttendanceController : ControllerBase
{
    private readonly ISafetyAlertService _safetyAlertService;
    private readonly IHubContext<EduBusHub> _hubContext;

    private static readonly string StorageFolder = Path.Combine(Directory.GetCurrentDirectory(), "Data");
    private static readonly string StudentsFilePath = Path.Combine(StorageFolder, "students.json");
    private static readonly string LogsFilePath = Path.Combine(StorageFolder, "logs.json");

    private static List<Student> StudentsDb = new();
    private static List<AttendanceLog> AttendanceLogsDb = new();
    private static int _nextStudentId = 1;

    static AttendanceController()
    {
        LoadDiskData();
    }

    public AttendanceController(ISafetyAlertService safetyAlertService, IHubContext<EduBusHub> hubContext)
    {
        _safetyAlertService = safetyAlertService;
        _hubContext = hubContext;
    }

    private static void LoadDiskData()
    {
        try
        {
            if (!Directory.Exists(StorageFolder)) Directory.CreateDirectory(StorageFolder);

            if (System.IO.File.Exists(StudentsFilePath))
            {
                var json = System.IO.File.ReadAllText(StudentsFilePath);
                StudentsDb = JsonSerializer.Deserialize<List<Student>>(json) ?? new();
                if (StudentsDb.Any()) _nextStudentId = StudentsDb.Max(s => s.Id) + 1;
            }

            if (System.IO.File.Exists(LogsFilePath))
            {
                var json = System.IO.File.ReadAllText(LogsFilePath);
                AttendanceLogsDb = JsonSerializer.Deserialize<List<AttendanceLog>>(json) ?? new();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[STORAGE ERROR]: {ex.Message}");
        }
    }

    private static void SaveDiskData()
    {
        try
        {
            if (!Directory.Exists(StorageFolder)) Directory.CreateDirectory(StorageFolder);
            System.IO.File.WriteAllText(StudentsFilePath, JsonSerializer.Serialize(StudentsDb));
            System.IO.File.WriteAllText(LogsFilePath, JsonSerializer.Serialize(AttendanceLogsDb));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[SAVE ERROR]: {ex.Message}");
        }
    }

    [HttpPost("register-student")]
    public IActionResult RegisterStudent([FromBody] RegisterStudentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName) || string.IsNullOrWhiteSpace(request.CardUid))
        {
            return BadRequest(new { Message = "O'quvchi ismi va Karta UID raqami to'ldirilishi shart!" });
        }

        if (StudentsDb.Any(s => s.CardUid.Equals(request.CardUid, StringComparison.OrdinalIgnoreCase)))
        {
            return BadRequest(new { Message = "Ushbu RFID Karta UID raqami allaqachon boshqa o'quvchiga biriktirilgan!" });
        }

        var student = new Student
        {
            Id = _nextStudentId++,
            FullName = request.FullName,
            ClassName = request.ClassName,
            ParentName = request.ParentName,
            ParentPhone = request.ParentPhone,
            CardUid = request.CardUid,
            AssignedBusId = request.AssignedBusId,
            Status = StudentStatus.AtHome
        };

        StudentsDb.Add(student);
        SaveDiskData();

        return Ok(new { Success = true, Message = "O'quvchi muvaffaqiyatli ro'yxatga olindi", Student = student });
    }

    [HttpPost("tap-card")]
    public async Task<IActionResult> ProcessCardTap([FromBody] CardTapRequest request)
    {
        var student = StudentsDb.FirstOrDefault(s => s.CardUid.Equals(request.CardUid, StringComparison.OrdinalIgnoreCase) || s.Id == request.StudentId);
        if (student == null)
        {
            return NotFound(new { Message = "Noma'lum Karta! O'quvchi ro'yxatdan o'tmagan." });
        }

        EventType eventType = (student.Status == StudentStatus.OnBus) 
            ? EventType.LeavingBus 
            : EventType.BoardingBus;

        student.Status = (eventType == EventType.BoardingBus) ? StudentStatus.OnBus : StudentStatus.AtSchool;
        student.LastTapTime = DateTime.Now;
        student.LastTapLocation = request.LocationName ?? "Avtobus Terminali Bekat";

        var log = new AttendanceLog
        {
            StudentId = student.Id,
            StudentName = student.FullName,
            BusId = request.BusId,
            BusNumber = request.BusNumber ?? "05 | 01 777 BAA",
            TapTime = DateTime.Now,
            EventType = eventType,
            LocationName = student.LastTapLocation
        };

        AttendanceLogsDb.Add(log);
        SaveDiskData();

        await _safetyAlertService.SendTelegramNotificationAsync(student, log);

        await _hubContext.Clients.All.SendAsync("ReceiveStudentTapAlert", new
        {
            LogId = log.Id,
            StudentId = student.Id,
            student.FullName,
            student.ClassName,
            log.BusNumber,
            EventType = eventType.ToString(),
            TapTime = log.TapTime.ToString("HH:mm:ss"),
            student.Status
        });

        return Ok(new
        {
            Success = true,
            Message = $"Karta tekkizildi: {student.FullName} -> {eventType}",
            StudentStatus = student.Status.ToString(),
            Log = log
        });
    }

    [HttpGet("students")]
    public IActionResult GetStudents()
    {
        return Ok(StudentsDb);
    }

    [HttpGet("logs")]
    public IActionResult GetLogs()
    {
        return Ok(AttendanceLogsDb.OrderByDescending(l => l.TapTime).Take(50));
    }

    [HttpDelete("student/{id}")]
    public IActionResult DeleteStudent(int id)
    {
        var student = StudentsDb.FirstOrDefault(s => s.Id == id);
        if (student == null) return NotFound(new { Message = "O'quvchi topilmadi" });

        StudentsDb.Remove(student);
        SaveDiskData();
        return Ok(new { Success = true, Message = "O'quvchi o'chirildi" });
    }
}

public class CardTapRequest
{
    public string CardUid { get; set; } = string.Empty;
    public int StudentId { get; set; }
    public int BusId { get; set; } = 5;
    public string? BusNumber { get; set; }
    public string? LocationName { get; set; }
}
