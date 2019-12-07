CREATE TABLE [dbo].[Bookmarks] (
    [Id]     INT            IDENTITY (1, 1) NOT NULL,
    [Title]  NVARCHAR (100) NOT NULL,
    [URL]    NVARCHAR (255) NOT NULL,
    [SeqNo]  INT            NOT NULL,
    [UserId] INT            NOT NULL,
    CONSTRAINT [PK_Bookmarks] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Bookmarks_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id])
);

