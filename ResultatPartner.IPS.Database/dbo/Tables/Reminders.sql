CREATE TABLE [dbo].[Reminders] (
    [Id]           INT            IDENTITY (1, 1) NOT NULL,
    [ReminderText] NVARCHAR (MAX) NULL,
    [DueDate]      DATETIME       NULL,
    [UserId]       INT            NULL,
    [TrainingId]   INT            NULL,
    [ProfileId]    INT            NULL,
    [IsReviewed]   BIT            NULL,
    [ReminderType] INT            NULL,
    CONSTRAINT [PK_Reminders] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Reminders_ReminderTypes] FOREIGN KEY ([ReminderType]) REFERENCES [dbo].[ReminderTypes] ([Id])
);

