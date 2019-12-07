CREATE TABLE [dbo].[Link_DepartmentUsers] (
    [DepartmentId] INT NOT NULL,
    [UserId]       INT NOT NULL,
    CONSTRAINT [PK_Link_DepartmentUsers] PRIMARY KEY CLUSTERED ([DepartmentId] ASC, [UserId] ASC),
    CONSTRAINT [FK_Link_DepartmentUsers_Departments] FOREIGN KEY ([DepartmentId]) REFERENCES [dbo].[Departments] ([Id]),
    CONSTRAINT [FK_Link_DepartmentUsers_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id])
);


GO
CREATE NONCLUSTERED INDEX [IX_Link_DepartmentUsers]
    ON [dbo].[Link_DepartmentUsers]([DepartmentId] ASC);

