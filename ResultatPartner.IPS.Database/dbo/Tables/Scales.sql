CREATE TABLE [dbo].[Scales] (
    [Id]                 INT             IDENTITY (1, 1) NOT NULL,
    [Name]               NVARCHAR (250)  NOT NULL,
    [Description]        NVARCHAR (1000) NULL,
    [ScaleCategoryId]    INT             NOT NULL,
    [MeasureUnitId]      INT             NOT NULL,
    [IncludeNotRelevant] BIT             CONSTRAINT [DF_Scales_IncludeNotRelevant] DEFAULT ((0)) NOT NULL,
    [IsTemplate]         BIT             CONSTRAINT [DF_Scales_IsTemplate] DEFAULT ((0)) NOT NULL,
    [ProfileType]        INT             NULL,
    CONSTRAINT [PK_Scales] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Scales_MeasureUnits] FOREIGN KEY ([MeasureUnitId]) REFERENCES [dbo].[MeasureUnits] ([Id]),
    CONSTRAINT [FK_Scales_ProfileTypes] FOREIGN KEY ([ProfileType]) REFERENCES [dbo].[ProfileTypes] ([Id]),
    CONSTRAINT [FK_Scales_ScaleCategories] FOREIGN KEY ([ScaleCategoryId]) REFERENCES [dbo].[ScaleCategories] ([Id])
);

