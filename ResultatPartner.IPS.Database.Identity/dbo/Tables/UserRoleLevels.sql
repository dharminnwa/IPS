CREATE TABLE [dbo].[UserRoleLevels] (
    [Id]                INT          IDENTITY (1, 1) NOT NULL,
    [Name]              VARCHAR (50) NOT NULL,
    [ParentRoleLevelId] INT          NULL,
    [OrganizationId]    INT          NULL,
    CONSTRAINT [PK_UserRoleLevels] PRIMARY KEY CLUSTERED ([Id] ASC)
);



