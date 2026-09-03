using Microsoft.AspNetCore.SignalR;

namespace EduBus.Api.Hubs;

public class EduBusHub : Hub
{
    public async Task SendLocationUpdate(int busId, double lat, double lng, double speed)
    {
        await Clients.All.SendAsync("ReceiveBusLocation", busId, lat, lng, speed);
    }

    public async Task BroadcastStudentTap(int studentId, string studentName, string busNumber, string eventType, string time)
    {
        await Clients.All.SendAsync("ReceiveStudentTapAlert", new
        {
            StudentId = studentId,
            StudentName = studentName,
            BusNumber = busNumber,
            EventType = eventType,
            Time = time
        });
    }

    public async Task SendSafetyWarning(string busNumber, string warningType, string message)
    {
        await Clients.All.SendAsync("ReceiveSafetyWarning", busNumber, warningType, message);
    }
}
