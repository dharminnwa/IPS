CREATE TABLE [dbo].[TaskCategoryListItems] (
    [Id]             INT            IDENTITY (1, 1) NOT NULL,
    [Name]           NVARCHAR (50)  NOT NULL,
    [Description]    NVARCHAR (MAX) NULL,
    [CategoryListId] INT            NOT NULL,
    [Color]          CHAR (7)       NULL,
    [TextColor]      CHAR (7)       NULL,
    CONSTRAINT [PK_TaskCategories] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_TaskCategoryListItems_TaskCategoryLists] FOREIGN KEY ([CategoryListId]) REFERENCES [dbo].[TaskCategoryLists] ([Id])
);

