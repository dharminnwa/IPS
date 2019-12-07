CREATE TABLE [dbo].[SensorData] (
    [Id]         INT           IDENTITY (1, 1) NOT NULL,
    [TrainingId] INT           NOT NULL,
    [UserId]     INT           NOT NULL,
    [TimeStamp]  SMALLDATETIME NOT NULL,
    [Yaw]        INT           NOT NULL,
    [Pitch]      INT           NOT NULL,
    [Roll]       INT           NOT NULL,
    CONSTRAINT [PK_SensorData] PRIMARY KEY CLUSTERED ([Id] ASC)
);

