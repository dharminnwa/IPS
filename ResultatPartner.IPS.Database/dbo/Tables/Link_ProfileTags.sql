CREATE TABLE [dbo].[Link_ProfileTags] (
    [Id]        INT IDENTITY (1, 1) NOT NULL,
    [ProfileId] INT NULL,
    [TagId]     INT NULL,
    CONSTRAINT [PK_Link_ProfileTags] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Link_ProfileTags_Profiles] FOREIGN KEY ([ProfileId]) REFERENCES [dbo].[Profiles] ([Id]),
    CONSTRAINT [FK_Link_ProfileTags_Tags] FOREIGN KEY ([TagId]) REFERENCES [dbo].[Tags] ([Id])
);

