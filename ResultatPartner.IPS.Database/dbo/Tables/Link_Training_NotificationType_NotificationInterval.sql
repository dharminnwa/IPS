CREATE TABLE [dbo].[Link_Training_NotificationType_NotificationInterval] (
    [TrainingId]             INT NOT NULL,
    [NotificationTypeId]     INT NOT NULL,
    [NotificationIntervalId] INT NOT NULL,
    CONSTRAINT [PK_Link_Training_NotificationType_NotificationInterval] PRIMARY KEY CLUSTERED ([TrainingId] ASC, [NotificationTypeId] ASC, [NotificationIntervalId] ASC),
    CONSTRAINT [FK_Link_Training_NotificationType_NotificationInterval_NotificationIntervals] FOREIGN KEY ([NotificationIntervalId]) REFERENCES [dbo].[NotificationIntervals] ([NotificationIntervalId]),
    CONSTRAINT [FK_Link_Training_NotificationType_NotificationInterval_NotificationTypes] FOREIGN KEY ([NotificationTypeId]) REFERENCES [dbo].[NotificationTypes] ([NotificationTypeId]),
    CONSTRAINT [FK_Link_Training_NotificationType_NotificationInterval_Trainings] FOREIGN KEY ([TrainingId]) REFERENCES [dbo].[Trainings] ([Id])
);

