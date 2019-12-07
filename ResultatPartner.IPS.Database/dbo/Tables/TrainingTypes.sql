CREATE TABLE [dbo].[TrainingTypes] (
    [Id]   INT            IDENTITY (1, 1) NOT NULL,
    [Name] NVARCHAR (250) NULL,
    CONSTRAINT [PK_TrainingTypes] PRIMARY KEY CLUSTERED ([Id] ASC)
);

