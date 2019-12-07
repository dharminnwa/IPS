CREATE TABLE [dbo].[ProjectSteeringGroups] (
    [Id]             INT           IDENTITY (1, 1) NOT NULL,
    [Name]           NVARCHAR (50) NOT NULL,
    [ProjectId]      INT           NOT NULL,
    [OrganizationId] INT           NULL,
    [RoleId]         INT           NULL,
    CONSTRAINT [PK_ProjectSteeringGroups] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_ProjectSteeringGroups_Organizations] FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id]),
    CONSTRAINT [FK_ProjectSteeringGroups_ProjectRoles] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[ProjectRoles] ([Id]),
    CONSTRAINT [FK_ProjectSteeringGroups_Projects] FOREIGN KEY ([ProjectId]) REFERENCES [dbo].[Projects] ([Id])
);





