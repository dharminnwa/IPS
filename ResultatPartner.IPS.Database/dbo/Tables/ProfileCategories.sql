CREATE TABLE [dbo].[ProfileCategories] (
    [Id]             INT            IDENTITY (1, 1) NOT NULL,
    [Name]           NVARCHAR (250) NOT NULL,
    [OrganizationId] INT            NULL,
    CONSTRAINT [PK_ProfileCategories] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_ProfileCategories_Organizations] FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id])
);

