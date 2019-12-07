CREATE TABLE [dbo].[TaskLists] (
    [Id]                  INT            IDENTITY (1, 1) NOT NULL,
    [Name]                NVARCHAR (100) NULL,
    [TaskStatusListId]    INT            NOT NULL,
    [TaskPriorityListId]  INT            NOT NULL,
    [UserId]              INT            NULL,
    [TaskCategoryListsId] INT            NULL,
    CONSTRAINT [PK_TaskLists] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_TaskLists_TaskCategoryLists] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id]),
    CONSTRAINT [FK_TaskLists_TaskPriorityLists] FOREIGN KEY ([TaskPriorityListId]) REFERENCES [dbo].[TaskPriorityLists] ([Id]),
    CONSTRAINT [FK_TaskLists_TaskStatusLists] FOREIGN KEY ([TaskStatusListId]) REFERENCES [dbo].[TaskStatusLists] ([Id])
);

