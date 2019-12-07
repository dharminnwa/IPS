CREATE TABLE [dbo].[ProspectingGoalScales] (
    [Id]                 INT           IDENTITY (1, 1) NOT NULL,
    [Name]               VARCHAR (50)  NOT NULL,
    [Description]        VARCHAR (MAX) NULL,
    [ScaleCategoryId]    INT           NOT NULL,
    [MeasureUnitId]      INT           NOT NULL,
    [IncludeNotRelevant] BIT           NOT NULL,
    [IsTemplate]         BIT           NOT NULL,
    [CreatedOn]          DATETIME      NULL,
    [CreatedBy]          INT           NULL,
    [ModifiedOn]         DATETIME      NULL,
    [ModifiedBy]         INT           NULL,
    CONSTRAINT [PK_ProspectingGoalScales] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_ProspectingGoalScales_MeasureUnits] FOREIGN KEY ([MeasureUnitId]) REFERENCES [dbo].[MeasureUnits] ([Id]),
    CONSTRAINT [FK_ProspectingGoalScales_ScaleCategories] FOREIGN KEY ([ScaleCategoryId]) REFERENCES [dbo].[ScaleCategories] ([Id])
);



