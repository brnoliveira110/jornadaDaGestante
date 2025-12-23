using System.Text.Json.Serialization;

namespace backend.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum UserRole
{
    DOCTOR,
    PATIENT
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum BloodType
{
    A_POS,
    A_NEG,
    B_POS,
    B_NEG,
    AB_POS,
    AB_NEG,
    O_POS,
    O_NEG
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ConsultationStatus
{
    SCHEDULED,
    COMPLETED
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum VaccineStatus
{
    PENDING,
    DONE,
    LATE
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ExamType
{
    PDF,
    IMAGE
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ExamStatus
{
    UPLOADED,
    REVIEWED,
    REQUESTED,
    REALIZED
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum AlertType
{
    WARNING,
    INFO,
    SUCCESS
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum AlertTargetRole
{
    DOCTOR,
    PATIENT,
    BOTH
}
