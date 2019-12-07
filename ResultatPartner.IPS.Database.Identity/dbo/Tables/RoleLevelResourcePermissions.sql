CREATE TABLE [dbo].[RoleLevelResourcePermissions] (
    [Id]          INT IDENTITY (1, 1) NOT NULL,
    [RoleLevelId] INT NOT NULL,
    [ResourceId]  INT NOT NULL,
    [OperationId] INT NOT NULL,
    CONSTRAINT [PK_RoleLevelResourcePermissions] PRIMARY KEY CLUSTERED ([Id] ASC)
);

