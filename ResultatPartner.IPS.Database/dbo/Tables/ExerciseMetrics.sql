CREATE TABLE [dbo].[ExerciseMetrics] (
    [Id]   INT            IDENTITY (1, 1) NOT NULL,
    [Name] NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_ExerciseMetrics] PRIMARY KEY CLUSTERED ([Id] ASC)
);

