CREATE TABLE [dbo].[NotificationTypes] (
    [NotificationTypeId] INT          IDENTITY (1, 1) NOT NULL,
    [Name]               VARCHAR (50) NOT NULL,
    CONSTRAINT [PK_NotificationTypes] PRIMARY KEY CLUSTERED ([NotificationTypeId] ASC)
);

