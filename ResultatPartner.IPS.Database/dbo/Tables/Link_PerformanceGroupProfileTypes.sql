CREATE TABLE [dbo].[Link_PerformanceGroupProfileTypes] (
    [PerformanceGroupId] INT NOT NULL,
    [ProfileTypeID]      INT NOT NULL,
    CONSTRAINT [PK_Link_PerformanceGroupProfileTypes] PRIMARY KEY CLUSTERED ([ProfileTypeID] ASC, [PerformanceGroupId] ASC),
    CONSTRAINT [FK_Link_PerformanceGroupProfileTypes_PerformanceGroups] FOREIGN KEY ([PerformanceGroupId]) REFERENCES [dbo].[PerformanceGroups] ([Id]),
    CONSTRAINT [FK_Link_PerformanceGroupProfileTypes_ProfileTypes] FOREIGN KEY ([ProfileTypeID]) REFERENCES [dbo].[ProfileTypes] ([Id])
);

