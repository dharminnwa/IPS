CREATE TABLE [dbo].[ProspectingGoalScaleRanges] (
    [Id]                     INT             IDENTITY (1, 1) NOT NULL,
    [ProspectingGoalScaleId] INT             NOT NULL,
    [Min]                    NUMERIC (18, 2) NOT NULL,
    [Max]                    NUMERIC (18, 2) NOT NULL,
    [Description]            NVARCHAR (100)  NULL,
    [Color]                  NCHAR (7)       NOT NULL,
    CONSTRAINT [PK_ProspectingGaolScaleRanges] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_ProspectingGaolScaleRanges_ProspectingGoalScales] FOREIGN KEY ([ProspectingGoalScaleId]) REFERENCES [dbo].[ProspectingGoalScales] ([Id])
);

