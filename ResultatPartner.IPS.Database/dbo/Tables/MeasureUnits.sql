CREATE TABLE [dbo].[MeasureUnits] (
    [Id]   INT           IDENTITY (1, 1) NOT NULL,
    [Name] NVARCHAR (50) NOT NULL,
    CONSTRAINT [PK_MeasureUnits] PRIMARY KEY CLUSTERED ([Id] ASC)
);

