CREATE TABLE [dbo].[TaskPriorityListItems] (
    [Id]             INT           IDENTITY (1, 1) NOT NULL,
    [PriorityNo]     INT           NOT NULL,
    [Name]           NVARCHAR (50) NOT NULL,
    [PriorityListId] INT           NOT NULL,
    [Description]    NCHAR (1000)  NULL,
    CONSTRAINT [PK_TaskPriorityListItems] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_TaskPriorityLists_TaskPriorityListItems] FOREIGN KEY ([PriorityListId]) REFERENCES [dbo].[TaskPriorityLists] ([Id])
);

