CREATE TABLE [dbo].[Link_ProjectUsers] (
    [ProjectId]       INT NOT NULL,
    [UserId]          INT NOT NULL,
    [RoleId]          INT NOT NULL,
    [SteeringGroupId] INT NOT NULL,
    CONSTRAINT [PK_Link_ProjectUsers] PRIMARY KEY CLUSTERED ([ProjectId] ASC, [UserId] ASC, [RoleId] ASC),
    CONSTRAINT [FK_Link_ProjectUsers_ProjectRoles] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[ProjectRoles] ([Id]),
    CONSTRAINT [FK_Link_ProjectUsers_Projects] FOREIGN KEY ([ProjectId]) REFERENCES [dbo].[Projects] ([Id]),
    CONSTRAINT [FK_Link_ProjectUsers_ProjectSteeringGroups] FOREIGN KEY ([SteeringGroupId]) REFERENCES [dbo].[ProjectSteeringGroups] ([Id]),
    CONSTRAINT [FK_Link_ProjectUsers_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id])
);



