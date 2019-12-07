CREATE TABLE [dbo].[ProspectingSchedule] (
    [Id]                          INT            IDENTITY (1, 1) NOT NULL,
    [ProspectingCustomerId]       INT            NULL,
    [ProspectingActivityId]       INT            NULL,
    [ProspectingCustomerResultId] INT            NULL,
    [IsMeeting]                   BIT            NOT NULL,
    [IsFollowUp]                  BIT            NOT NULL,
    [ScheduleDate]                DATETIME       NOT NULL,
    [Agenda]                      VARCHAR (MAX)  NOT NULL,
    [CreatedOn]                   DATETIME       NULL,
    [CreatedBy]                   INT            NULL,
    [ModifiedOn]                  DATETIME       NULL,
    [ModiffiedBy]                 INT            NULL,
    [TaskId]                      INT            NULL,
    [IsServiceAgreed]             BIT            CONSTRAINT [DF_ProspectingSchedule_IsServiceAgreed] DEFAULT ((0)) NOT NULL,
    [ProspectingType]             INT            CONSTRAINT [DF_ProspectingSchedule_ProspectingType] DEFAULT ((0)) NOT NULL,
    [Notification]                NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_ProspectingSchedule] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Table_1_ProspectingActivities] FOREIGN KEY ([ProspectingActivityId]) REFERENCES [dbo].[ProspectingActivities] ([Id]),
    CONSTRAINT [FK_Table_1_ProspectingCustomerResult] FOREIGN KEY ([ProspectingCustomerResultId]) REFERENCES [dbo].[ProspectingCustomerResult] ([Id]),
    CONSTRAINT [FK_Table_1_ProspectingCustomers] FOREIGN KEY ([ProspectingCustomerId]) REFERENCES [dbo].[ProspectingCustomers] ([Id])
);







