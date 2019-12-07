CREATE TABLE [dbo].[NotificationIntervals] (
    [NotificationIntervalId] INT          IDENTITY (1, 1) NOT NULL,
    [Name]                   VARCHAR (50) NOT NULL,
    CONSTRAINT [PK_NotificationIntervals] PRIMARY KEY CLUSTERED ([NotificationIntervalId] ASC)
);

