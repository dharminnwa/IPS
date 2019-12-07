CREATE TABLE [dbo].[ScaleCategories] (
    [Id]   INT           IDENTITY (1, 1) NOT NULL,
    [Name] NVARCHAR (50) NULL,
    CONSTRAINT [PK_ScaleCategories] PRIMARY KEY CLUSTERED ([Id] ASC)
);

