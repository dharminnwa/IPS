CREATE TABLE [dbo].[RoleLevelAdvancePermission] (
    [Id]                INT IDENTITY (1, 1) NOT NULL,
    [RoleLevelId]       INT NULL,
    [PermissionLevelId] INT NULL,
    CONSTRAINT [PK_RoleLevelAdvancePermission] PRIMARY KEY CLUSTERED ([Id] ASC)
);

