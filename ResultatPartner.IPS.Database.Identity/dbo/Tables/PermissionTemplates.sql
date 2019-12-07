CREATE TABLE [dbo].[PermissionTemplates] (
    [Id]   INT          IDENTITY (1, 1) NOT NULL,
    [Name] VARCHAR (50) NOT NULL,
    CONSTRAINT [PK_RoleLevelPermissionTemplates] PRIMARY KEY CLUSTERED ([Id] ASC)
);

