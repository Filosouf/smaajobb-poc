namespace SmaaJobb.Api.Domain;

public enum UserType
{
    Adult,
    Minor
}

public enum VerifyStatus
{
    Unverified,
    EmailVerified,
    BankIdVerified
}

public enum GuardianRelationshipStatus
{
    Pending,
    Active,
    Revoked
}

public enum PriceModel
{
    FixedPrice,
    HourlyRate
}

public enum DeadlineType
{
    ByDate,
    WithinDays,
    OpenEnded
}

public enum JobStatus
{
    Draft,
    AwaitingPayment,
    Open,
    Assigned,
    AwaitingConfirmation,
    Completed,
    Cancelled,
    Disputed
}

public enum ApplicationStatus
{
    PendingGuardianApproval,
    Pending,
    Accepted,
    Rejected,
    Withdrawn
}

public enum PaymentStatus
{
    Pending,
    Succeeded,
    Refunded,
    Failed
}
