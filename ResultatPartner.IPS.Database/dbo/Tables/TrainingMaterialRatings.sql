CREATE TABLE [dbo].[TrainingMaterialRatings] (
    [Id]                 INT      IDENTITY (1, 1) NOT NULL,
    [TrainingMaterialId] INT      NULL,
    [Rating]             INT      NULL,
    [RatingBy]           INT      NULL,
    [RatingSubmitDate]   DATETIME NULL,
    CONSTRAINT [PK_TrainingMaterialRatings] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_TrainingMaterialRatings_TrainingMaterials] FOREIGN KEY ([TrainingMaterialId]) REFERENCES [dbo].[TrainingMaterials] ([Id]),
    CONSTRAINT [FK_TrainingMaterialRatings_Users] FOREIGN KEY ([RatingBy]) REFERENCES [dbo].[Users] ([Id])
);

