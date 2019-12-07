CREATE TABLE [dbo].[DurationMetrics] (
    [Id]   INT            IDENTITY (1, 1) NOT NULL,
    [Name] NVARCHAR (100) NULL,
    CONSTRAINT [PK_DurationMetrics] PRIMARY KEY CLUSTERED ([Id] ASC)
);

