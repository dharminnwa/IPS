CREATE TABLE [dbo].[TrainingMaterials] (
    [Id]           INT            IDENTITY (1, 1) NOT NULL,
    [Title]        NVARCHAR (250) NULL,
    [Name]         NVARCHAR (250) NULL,
    [Description]  NVARCHAR (MAX) NULL,
    [TrainingId]   INT            NULL,
    [MaterialType] NVARCHAR (255) NULL,
    [ResourceType] NVARCHAR (255) NULL,
    [Link]         NVARCHAR (MAX) NULL,
    [CreatedBy]    INT            NULL,
    [CreatedOn]    DATETIME       NULL,
    CONSTRAINT [PK_TrainingMaterials] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_TrainingMaterials_Trainings] FOREIGN KEY ([TrainingId]) REFERENCES [dbo].[Trainings] ([Id])
);



