CREATE TABLE [dbo].[ScorecardPerspectives] (
    [Id]             INT            IDENTITY (1, 1) NOT NULL,
    [Name]           NVARCHAR (100) NOT NULL,
    [OrganizationId] INT            NULL,
    CONSTRAINT [PK_ScorecardPerspectives] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Organizations_ScorecardPerspectives] FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id])
);

