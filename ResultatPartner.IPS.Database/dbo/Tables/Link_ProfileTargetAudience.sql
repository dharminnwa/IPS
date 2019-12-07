CREATE TABLE [dbo].[Link_ProfileTargetAudience] (
    [ProfileId]     INT NOT NULL,
    [JobPositionID] INT NOT NULL,
    CONSTRAINT [PK_ProfileTargetAudience_1] PRIMARY KEY CLUSTERED ([JobPositionID] ASC, [ProfileId] ASC),
    CONSTRAINT [FK_ProfileTargetAudience_JobPositions] FOREIGN KEY ([JobPositionID]) REFERENCES [dbo].[JobPositions] ([Id]),
    CONSTRAINT [FK_ProfileTargetAudience_Profiles] FOREIGN KEY ([ProfileId]) REFERENCES [dbo].[Profiles] ([Id])
);

