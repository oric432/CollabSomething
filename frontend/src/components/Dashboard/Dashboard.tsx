import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { getAllSessions } from "@/store/slices/sessionSlice";
import { getAllClasses } from "@/store/slices/classSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { ClassList } from "./ClassList";
import { SessionList } from "./SessionList";

export function Dashboard() {
    const dispatch = useDispatch<AppDispatch>();
    const { classes, isLoading: classesLoading } = useSelector(
        (state: RootState) => state.class
    );
    const { activeSessions, isLoading: sessionsLoading } = useSelector(
        (state: RootState) => state.session
    );
    const { user, isTeacher } = useAuth();

    useEffect(() => {
        dispatch(getAllClasses());
        dispatch(getAllSessions());
    }, [dispatch]);

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">
                        Welcome, {user?.name}
                    </h1>
                    <p className="text-gray-600">
                        Manage your classes and sessions
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Classes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {classes.length}
                        </div>
                        <p className="text-gray-600">Total Classes</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Active Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {activeSessions.length}
                        </div>
                        <p className="text-gray-600">Ongoing Sessions</p>
                    </CardContent>
                </Card>

                {isTeacher && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Students</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {classes.reduce(
                                    (total, c) =>
                                        total + (c.students?.length || 0),
                                    0
                                )}
                            </div>
                            <p className="text-gray-600">Total Enrolled</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Tabs defaultValue="classes">
                <TabsList>
                    <TabsTrigger value="classes">Classes</TabsTrigger>
                    <TabsTrigger value="active-sessions">
                        Active Sessions
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="classes">
                    <ClassList classes={classes} isLoading={classesLoading} />
                </TabsContent>

                <TabsContent value="active-sessions">
                    <SessionList
                        sessions={activeSessions}
                        isLoading={sessionsLoading}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
