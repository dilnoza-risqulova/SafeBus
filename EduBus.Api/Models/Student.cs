namespace EduBus.Api.Models;

public class Student
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string ClassName { get; set; } = string.Empty;
    public string ParentName { get; set; } = string.Empty;
    public string ParentPhone { get; set; } = string.Empty;
    public string CardUid { get; set; } = string.Empty;
    public int AssignedBusId { get; set; }
    public StudentStatus Status { get; set; } = StudentStatus.AtHome;
    public DateTime? LastTapTime { get; set; }
    public string? LastTapLocation { get; set; }
}

public class RegisterStudentRequest
{
    public string FullName { get; set; } = string.Empty;
    public string ClassName { get; set; } = string.Empty;
    public string ParentName { get; set; } = string.Empty;
    public string ParentPhone { get; set; } = string.Empty;
    public string CardUid { get; set; } = string.Empty;
    public int AssignedBusId { get; set; } = 5;
}

public enum StudentStatus
{
    AtHome,
    OnBus,
    AtSchool,
    DroppedHome
}
