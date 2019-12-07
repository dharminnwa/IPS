CREATE TABLE [dbo].[TrainingLevels] (
    [Id]   INT           IDENTITY (1, 1) NOT NULL,
    [Name] NVARCHAR (50) NULL,
    CONSTRAINT [PK_TrainingLevels] PRIMARY KEY CLUSTERED ([Id] ASC)
);

