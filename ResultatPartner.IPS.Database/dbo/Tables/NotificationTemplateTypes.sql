CREATE TABLE [dbo].[NotificationTemplateTypes] (
    [Id]       INT          IDENTITY (1, 1) NOT NULL,
    [Name]     VARCHAR (50) NOT NULL,
    [Category] VARCHAR (50) NULL,
    CONSTRAINT [PK_NotificationTemplateTypes] PRIMARY KEY CLUSTERED ([Id] ASC)
);



