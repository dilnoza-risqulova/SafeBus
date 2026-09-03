using EduBus.Api.Models;

namespace EduBus.Api.Services;

public interface ISafetyAlertService
{
    Task<bool> SendTelegramNotificationAsync(Student student, AttendanceLog log);
    Task<List<Student>> CheckUncheckedStudentsOnBusAsync(int busId, List<Student> busStudents);
    bool VerifySpeedLimit(Bus bus, out string warningMessage);
}

public class SafetyAlertService : ISafetyAlertService
{
    private readonly ILogger<SafetyAlertService> _logger;

    public SafetyAlertService(ILogger<SafetyAlertService> logger)
    {
        _logger = logger;
    }

    public async Task<bool> SendTelegramNotificationAsync(Student student, AttendanceLog log)
    {
        // Mocking Telegram Bot API call (HttpClient -> https://api.telegram.org/bot<TOKEN>/sendMessage)
        string actionText = log.EventType == EventType.BoardingBus 
            ? "№" + log.BusNumber + "-avtobusga chiqdi 🟢" 
            : "avtobusdan tushdi 🔴";

        string message = $"📩 *EduBus Safe Ogohlantirish*\n\n" +
                         $"Farzandingiz *{student.FullName}* ({student.ClassName})\n" +
                         $"Vaqti: *{log.TapTime:HH:mm:ss}*\n" +
                         $"Joylashuv: *{log.LocationName}*\n" +
                         $"Holat: *{actionText}*\n\n" +
                         $"_EduBus xavfsizlik tizimi parvarishida_";

        _logger.LogInformation("[NOTIFICATION SENT] To Parent Phone: {Phone} | Text: {Msg}", student.ParentPhone, message);
        
        await Task.Delay(100); // Simulate API latency
        return true;
    }

    public Task<List<Student>> CheckUncheckedStudentsOnBusAsync(int busId, List<Student> busStudents)
    {
        // Find students who checked in to the bus but never tapped out upon arrival
        var leftBehindStudents = busStudents
            .Where(s => s.AssignedBusId == busId && s.Status == StudentStatus.OnBus)
            .ToList();

        if (leftBehindStudents.Any())
        {
            _logger.LogWarning("[SAFETY ALERT] Bus {BusId} has {Count} unchecked student(s) left behind!", busId, leftBehindStudents.Count);
        }

        return Task.FromResult(leftBehindStudents);
    }

    public bool VerifySpeedLimit(Bus bus, out string warningMessage)
    {
        if (bus.SpeedKmH > bus.MaxSpeedLimit)
        {
            warningMessage = $"⚠️ OGOHLANTIRISH: #{bus.BusNumber} avtobus belgilangan {bus.MaxSpeedLimit} km/soat tezlikni oshirdi! Amaldagi tezlik: {bus.SpeedKmH} km/soat";
            _logger.LogWarning(warningMessage);
            return false;
        }

        warningMessage = string.Empty;
        return true;
    }
}
