CREATE TABLE [dbo].[TaskStatusLists] (
    [Id]             INT            IDENTITY (1, 1) NOT NULL,
    [Name]           NVARCHAR (50)  NULL,
    [Description]    NVARCHAR (MAX) NULL,
    [IsTemplate]     BIT            CONSTRAINT [DF_TaskStatusLists_IsTemplate] DEFAULT ((0)) NOT NULL,
    [OrganizationId] INT            NULL,
    [DepartmentId]   INT            NULL,
    [TeamId]         INT            NULL,
    [UserId]         INT            NULL,
    CONSTRAINT [PK_TaskStatusLists] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_TaskStatusLists_Departments] FOREIGN KEY ([DepartmentId]) REFERENCES [dbo].[Departments] ([Id]),
    CONSTRAINT [FK_TaskStatusLists_Organizations] FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id]),
    CONSTRAINT [FK_TaskStatusLists_Teams] FOREIGN KEY ([TeamId]) REFERENCES [dbo].[Teams] ([Id]),
    CONSTRAINT [FK_TaskStatusLists_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id])
);

