CREATE TABLE [dbo].[Link_TrainingParticipants] (
    [TrainingId] INT            NOT NULL,
    [UserId]     NVARCHAR (128) NOT NULL,
    CONSTRAINT [PK_TrainingParticipants] PRIMARY KEY CLUSTERED ([TrainingId] ASC, [UserId] ASC),
    CONSTRAINT [FK_TrainingParticipants_Trainings] FOREIGN KEY ([TrainingId]) REFERENCES [dbo].[Trainings] ([Id])
);

