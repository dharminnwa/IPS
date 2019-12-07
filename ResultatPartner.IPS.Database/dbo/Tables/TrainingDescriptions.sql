CREATE TABLE [dbo].[TrainingDescriptions] (
    [Id]              INT            IDENTITY (1, 1) NOT NULL,
    [DescriptionType] INT            NULL,
    [Description]     NVARCHAR (MAX) NULL,
    [SkillId]         INT            NULL,
    CONSTRAINT [PK_TrainingDescriptions] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_TrainingDescriptions_Skills] FOREIGN KEY ([SkillId]) REFERENCES [dbo].[Skills] ([Id])
);

