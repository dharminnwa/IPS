CREATE TABLE [dbo].[Countries] (
    [Id]          INT            NOT NULL,
    [CountryName] NVARCHAR (150) NULL,
    [FlagImage]   NVARCHAR (255) NULL,
    CONSTRAINT [PK_Countries] PRIMARY KEY CLUSTERED ([Id] ASC)
);

