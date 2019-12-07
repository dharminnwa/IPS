CREATE TABLE [dbo].[Link_TeamUsers] (
    [TeamId]     INT           NOT NULL,
    [UserId]     INT           NOT NULL,
    [RoleInTeam] NVARCHAR (50) NULL,
    CONSTRAINT [PK_Link_TeamUsers] PRIMARY KEY CLUSTERED ([TeamId] ASC, [UserId] ASC),
    CONSTRAINT [FK_Link_TeamUsers_Teams] FOREIGN KEY ([TeamId]) REFERENCES [dbo].[Teams] ([Id]),
    CONSTRAINT [FK_Link_TeamUsers_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id])
);

