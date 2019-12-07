CREATE TABLE [dbo].[TaskStatusListItems] (
    [Id]               INT            IDENTITY (1, 1) NOT NULL,
    [Name]             NVARCHAR (50)  NOT NULL,
    [Description]      NVARCHAR (MAX) NULL,
    [TaskStatusListId] INT            NOT NULL,
    [SeqNo]            INT            NOT NULL,
    CONSTRAINT [PK_TaskStatusListItems] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_TaskStatusListItems_TaskStatusLists] FOREIGN KEY ([TaskStatusListId]) REFERENCES [dbo].[TaskStatusLists] ([Id])
);

