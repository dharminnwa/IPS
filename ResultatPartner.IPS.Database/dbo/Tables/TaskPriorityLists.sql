CREATE TABLE [dbo].[TaskPriorityLists] (
    [Id]             INT            IDENTITY (1, 1) NOT NULL,
    [Name]           NVARCHAR (50)  NOT NULL,
    [Description]    NVARCHAR (MAX) NULL,
    [IsTemplate]     BIT            CONSTRAINT [DF_TaskPriorityLists_IsTemplate] DEFAULT ((0)) NOT NULL,
    [OrganizationId] INT            NULL,
    [DepartmentId]   INT            NULL,
    [TeamId]         INT            NULL,
    [UserId]         INT            NULL,
    CONSTRAINT [PK_TaskPriorityLists] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_TaskPriorityLists_Departments] FOREIGN KEY ([DepartmentId]) REFERENCES [dbo].[Departments] ([Id]),
    CONSTRAINT [FK_TaskPriorityLists_Organizations] FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id]),
    CONSTRAINT [FK_TaskPriorityLists_Teams] FOREIGN KEY ([TeamId]) REFERENCES [dbo].[Teams] ([Id]),
    CONSTRAINT [FK_TaskPriorityLists_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id])
);

