export default function UserPaymentsPage({ 
    params
} : {
    params: {userID: string}
}) {
    return (
        <div>
            User Payments Page {params.userID}
        </div>
    )
}