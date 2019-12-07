CREATE TABLE [dbo].[Tags] (
    [Id]             INT            IDENTITY (1, 1) NOT NULL,
    [Name]           NVARCHAR (250) NOT NULL,
    [OrganizationId] INT            NULL,
    CONSTRAINT [PK_ProfileTags] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_ProfileTags_Organizations] FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id])
);

