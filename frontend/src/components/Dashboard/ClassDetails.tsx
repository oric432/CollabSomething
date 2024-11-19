import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { getClass, deleteClass } from "@/store/slices/classSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnrollStudentDialog } from "./EnrollStudentDialog";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";
import { SessionList } from "./SessionList";
import { CreateSessionDialog } from "./CreateSessionDialog";
import { Session } from "@/store/slices/sessionSlice";

export function ClassDetails() {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { currentClass, isLoading } = useSelector(
        (state: RootState) => state.class
    );

    const { user } = useAuth();

    useEffect(() => {
        if (id) {
            dispatch(getClass(id));
        }
    }, [id, dispatch]);

    const handleDelete = async () => {
        if (!id) return;
        try {
            await dispatch(deleteClass(id)).unwrap();
            toast.success("Class deleted successfully");
            navigate("/dashboard");
        } catch (error) {
            console.log(error);
            toast.error("Failed to delete class");
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                Loading class details...
            </div>
        );
    }

    if (!currentClass) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                Class not found
            </div>
        );
    }

    const isClassTeacher = currentClass.teacher.id === user?.id;

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">{currentClass.name}</h1>
                    <p className="text-gray-600">{currentClass.description}</p>
                </div>
                {isClassTeacher && (
                    <div className="space-x-2">
                        <CreateSessionDialog
                            classId={currentClass.id}
                            onSessionCreated={() =>
                                dispatch(getClass(currentClass.id))
                            }
                        />
                        <EnrollStudentDialog classId={currentClass.id} />
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete Class
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Class Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p>
                                <span className="font-semibold">Teacher:</span>{" "}
                                {currentClass.teacher.name}
                            </p>
                            <p>
                                <span className="font-semibold">Email:</span>{" "}
                                {currentClass.teacher.email}
                            </p>
                            <p>
                                <span className="font-semibold">Status:</span>{" "}
                                {currentClass.status}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            Enrolled Students ({currentClass.students.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {currentClass.students.length === 0 ? (
                            <p className="text-gray-500">
                                No students enrolled yet
                            </p>
                        ) : (
                            <ul className="space-y-2">
                                {currentClass.students.map((enrollment) => (
                                    <li
                                        key={enrollment.student.id}
                                        className="flex justify-between items-center"
                                    >
                                        <span>{enrollment.student.name}</span>
                                        <span className="text-gray-500 text-sm">
                                            {enrollment.student.email}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="mt-6">
                <SessionList
                    sessions={currentClass.sessions as Session[]}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}
