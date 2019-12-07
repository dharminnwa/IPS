CREATE TABLE [dbo].[Link_UsersJobPositions] (
    [UserId]        INT NOT NULL,
    [JobPositionId] INT NOT NULL,
    CONSTRAINT [PK_Link_UsersJobPositions] PRIMARY KEY CLUSTERED ([UserId] ASC, [JobPositionId] ASC),
    CONSTRAINT [FK_Link_UsersJobPositions_JobPositions] FOREIGN KEY ([JobPositionId]) REFERENCES [dbo].[JobPositions] ([Id]),
    CONSTRAINT [FK_Link_UsersJobPositions_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id])
);

