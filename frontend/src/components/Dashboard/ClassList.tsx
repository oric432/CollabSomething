import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateClassDialog } from "./CreateClassDialog";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Class } from "@/store/slices/classSlice";

interface ClassListProps {
    classes: Class[];
    isLoading: boolean;
}

export function ClassList({ classes, isLoading }: ClassListProps) {
    const navigate = useNavigate();
    const { isTeacher } = useAuth();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                Loading classes...
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">My Classes</h1>
                {isTeacher && <CreateClassDialog />}
            </div>

            {classes.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No classes available</p>
                    {isTeacher && <CreateClassDialog />}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classes.map((classItem) => (
                        <Card
                            key={classItem.id}
                            className="cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => navigate(`/class/${classItem.id}`)}
                        >
                            <CardHeader>
                                <CardTitle>{classItem.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-4">
                                    {classItem.description}
                                </p>
                                <div className="text-sm space-y-1">
                                    <p>
                                        <span className="font-semibold">
                                            Teacher:
                                        </span>{" "}
                                        {classItem.teacher.name}
                                    </p>
                                    <p>
                                        <span className="font-semibold">
                                            Students:
                                        </span>{" "}
                                        {classItem.students?.length || 0}
                                    </p>
                                    <p>
                                        <span className="font-semibold">
                                            Sessions:
                                        </span>{" "}
                                        {classItem.sessions?.length || 0}
                                    </p>
                                    <p>
                                        <span className="font-semibold">
                                            Status:
                                        </span>{" "}
                                        {classItem.status}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
