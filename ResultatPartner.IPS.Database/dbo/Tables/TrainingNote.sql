CREATE TABLE [dbo].[TrainingNote] (
    [Id]          INT           IDENTITY (1, 1) NOT NULL,
    [TrainingId]  INT           NOT NULL,
    [Goal]        VARCHAR (MAX) NULL,
    [MeasureInfo] VARCHAR (MAX) NULL,
    [ProceedInfo] VARCHAR (MAX) NULL,
    [OtherInfo]   VARCHAR (MAX) NULL,
    [CreatedOn]   DATETIME      NULL,
    [CreatedBy]   INT           NULL,
    [ModifiedOn]  DATETIME      NULL,
    [ModifiedBy]  INT           NULL,
    CONSTRAINT [PK_TrainingNote] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_TrainingNote_Trainings] FOREIGN KEY ([TrainingId]) REFERENCES [dbo].[Trainings] ([Id])
);

