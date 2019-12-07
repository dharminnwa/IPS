CREATE TABLE [dbo].[PermissionLevels] (
    [Id]   INT          IDENTITY (1, 1) NOT NULL,
    [Name] VARCHAR (50) NOT NULL,
    CONSTRAINT [PK_PermissionLevels] PRIMARY KEY CLUSTERED ([Id] ASC)
);

