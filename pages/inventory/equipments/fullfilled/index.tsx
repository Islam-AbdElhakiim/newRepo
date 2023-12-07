import Button from "@/components/Button";
import PageHeader from "@/components/PageHeader";
import Search from "@/components/Search";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { MdModeEdit, MdOutlineAdd } from "react-icons/md";
import { PiDotsThreeCircleLight } from "react-icons/pi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { TbArrowsSort, TbTextDirectionLtr } from "react-icons/tb";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { Account, EmployeeType, accountType } from "@/types";
import { HIDE_LOADER, SHOW_LOADER } from "@/redux/modules/loader-slice";
import Loader from "@/components/Loader";
import MyModal from "@/components/MyModal";
import Link from "next/link";
import { getRequest } from "@/http/requests";
import { deleteUserById, getAllEmployees } from "@/http/employeeHttp";
import { deleteAccountById, getAllAccounts } from "@/http/accountsHttp";
import { GETALLACCOUNTS } from "@/redux/modules/accounts-slice";
import { IoArrowForward } from "react-icons/io5";
import { getAllVariants } from "@/http/equipmentsHttp";

export const getServerSideProps = async ({ locale }: any) => {
    const data = await getAllVariants();
    return {
        props: {
            fulfilleds: data,
            ...(await serverSideTranslations(locale, ["common"])),
        },
    };
};

export default function Accounts({ fulfilleds }: any) {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation("common", {
        bindI18n: "languageChanged loaded",
    });
    console.log(fulfilleds);

    const user = useSelector((state: any) => state.authReducer);
    const { isLoading } = useSelector((state: any) => state.loaderReducer);

    // const [allEmployees, setAllEmployees] = useState<EmployeeType[]>(employees);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageRows, setPageRows] = useState(fulfilleds?.slice());

    const [selectedRows, setSelectedRows] = useState(new Array());

    // modal
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [modalTitle, setModalTitle] = useState<string>();
    const [modalBody, setModalBody] = useState<string>();
    const [modalTrue, setModalTrue] = useState<() => void>(() => { });




    //#region pagination
    let startingIndex = currentPage == 1 ? 0 : (currentPage - 1) * 10;

    const handlePrevPagination = () => {
        if (currentPage > 1) setCurrentPage((prev: number) => prev - 1);
    };
    const handleNextPagination = () => {
        if (10 * currentPage < fulfilleds?.length)
            setCurrentPage((prev: number) => prev + 1);
    };
    //#endregion

    //#region handle selecting employee Account
    const handleClick = (emp: any) => {
        if (!selectedRows.includes(emp._id)) {
            setSelectedRows([...selectedRows, emp._id]);
        } else {
            setSelectedRows(
                selectedRows.filter((fulfilleds) => fulfilleds != emp._id)
            );
        }
    };
    //selecting all emplyee
    const selectAll = () => {
        setSelectedRows(fulfilleds.map((acc: any) => acc._id));
        if (selectedRows?.length == fulfilleds?.length) {
            setSelectedRows([]);
        }
    };
    //#endregion

    //#region handle interna search method
    const handleSearch = (value: string) => {
        if (value) {
            setPageRows(
                pageRows.filter((acc: { englishName: string }) =>
                    acc.englishName.startsWith(value)
                )
            );
        } else {
            setPageRows(fulfilleds?.slice());
        }
    };
    //#endregion

    //#region handleDelete
    const handleDelete = async () => {
        const deletefulfilleds = async () => {
            dispatch(SHOW_LOADER());
            try {
                // selectedRows
                //     .filter((id) => id != user._id)
                //     .forEach(async (_id) => {
                //         await deleteAccountById(_id);
                //     });
                setPageRows((prev: Account[]) =>
                    prev.filter((acc) => !selectedRows.includes(acc._id))
                );
            } catch (e) {
                console.log("error in deleting account", e);
            } finally {
                dispatch(HIDE_LOADER());
            }
        };

        setModalTitle("Are you sure?");
        setModalBody(
            "Deleteing the selected account/s will ERASE THEM FOREVER from the database! "
        );
        setModalTrue(() => deletefulfilleds);
        setIsOpen(true);
        //#endregion
    };

    return (
        <>
            {isLoading ? (
                <Loader />
            ) : (
                <div className="flex flex-col justify-center items-center px-5 h-full ">
                    <PageHeader pageTitle="pages.acc" newUrl={`accounts/new`} />
                    {/* Page Body */}
                    <div className="flex flex-col justify-cstart enter items-center  bg-white rounded-2xl shadow-lg w-full h-full px-10 ">
                        {/* top control row */}
                        <div className="flex justify-center items-center w-full  py-3">
                            {/* top pagination
                    <div className="flex justify-center items-center gap-2 font-light">
                        <p>Showing</p>
                        <div className="flex p-2 rounded-lg border border-lightGray gap-2">
                            <select name="count" id="count" className="bg-transparent w-[60px] outline-none" onChange={(e) => setPerPage(+e.target.value)}>
                                <option value="3">03</option>
                                <option value="5" selected>05</option>
                                <option value="7">07</option>
                            </select>
                            {/* <BiArrowToBottom /> 
                        </div>
                        <p>entries</p>

                    </div> */}

                            {/* page Control */}
                            <div className="flex justify-center items-center">
                                {/* Search */}
                                <Search
                                    classes="rounded-lg w-[180px]"
                                    onSearch={handleSearch}
                                />

                                {/* CRUD Operations */}
                                <Button
                                    icon={
                                        <span className="text-[#00733B] transition group-hover:text-white text-2xl">
                                            <MdOutlineAdd />
                                        </span>
                                    }
                                    title="Create"
                                    classes=" hover:bg-[#00733B] group hover:text-[white] transition"
                                    isLink={true}
                                    href={"/accounts/new"}
                                />
                                <Button
                                    icon={
                                        <span
                                            className={` text-2xl transition ${selectedRows.length != 1
                                                ? " text-darkGray group-hover:!text-darkGray pointer-events-none"
                                                : "text-mainBlue group-hover:!text-white pointer-events-auto"
                                                } `}
                                        >
                                            <MdModeEdit />
                                        </span>
                                    }
                                    title="Update"
                                    classes={`${selectedRows.length != 1
                                        ? " !bg-bgGray hover:!bg-bgGray pointer-events-none "
                                        : "!bg-lightGray hover:!bg-mainBlue hover:text-white pointer-events-auto"
                                        }  group `}
                                    isDisabled={selectedRows.length != 1}
                                    handleOnClick={() =>
                                        router.push(`/inventory/products/pallets/${selectedRows[0]}?isEdit=true`)
                                    }
                                />
                                <Button
                                    icon={
                                        <span
                                            className={` text-2xl transition ${selectedRows.length < 1
                                                ? " text-darkGray group-hover:!text-darkGray pointer-events-none"
                                                : "!text-[#E70C0C] group-hover:!text-white pointer-events-auto"
                                                } `}
                                        >
                                            {" "}
                                            <RiDeleteBin6Line />
                                        </span>
                                    }
                                    title="Delete"
                                    classes={`${selectedRows.length < 1
                                        ? " !bg-bgGray hover:!bg-bgGray pointer-events-none"
                                        : "!bg-lightGray hover:!bg-red-500 hover:text-white pointer-events-auto"
                                        }  group `}
                                    isDisabled={selectedRows.length < 1}
                                    handleOnClick={handleDelete}
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="main-table w-full h-[80%] overflow-auto">
                            <table className={` w-full`}>
                                <thead className=" bg-bgGray ">
                                    <tr className="  text-left ">
                                        <th className="">
                                            <input
                                                type="checkbox"
                                                className=" cursor-pointer"
                                                checked={selectedRows?.length == fulfilleds?.length}
                                                onClick={() => selectAll()}
                                                readOnly
                                            />
                                        </th>

                                        <th className="">
                                            <span className=" inline-block relative top-1  mr-1 ">
                                                {" "}
                                                <TbArrowsSort />{" "}
                                            </span>
                                            <span>Equipment</span>
                                        </th>
                                        <th className="">
                                            <span className=" inline-block relative top-1 mr-1 ">
                                                {" "}
                                                <TbArrowsSort />{" "}
                                            </span>
                                            <span>Count</span>
                                        </th>
                                        <th className="">
                                            <span className=" inline-block relative top-1 mr-1 ">
                                                {" "}
                                                <TbArrowsSort />{" "}
                                            </span>
                                            <span>Fullfill Date</span>
                                        </th>
                                        <th className="">
                                            <span className=" inline-block relative top-1 mr-1 ">
                                                {" "}
                                                <TbArrowsSort />{" "}
                                            </span>
                                            <span>Station</span>
                                        </th>
                                        <th className="">
                                            <span className=" inline-block relative top-1 mr-1 ">
                                                {" "}
                                                <TbArrowsSort />{" "}
                                            </span>
                                            <span>Note</span>
                                        </th>

                                        <th className="">
                                            <span className="  text-darkGray text-[26px]">
                                                <PiDotsThreeCircleLight />
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="main-table overflow-auto">
                                    {pageRows
                                        ?.filter((row: any) => !row.isDeleted)
                                        .map((row: any, index: number) => {
                                            if (index >= startingIndex && index < currentPage * 10) {
                                                return (
                                                    <tr key={row._id} className=" text-left h-full">
                                                        <td
                                                            className="check"
                                                            onClick={() => handleClick(row)}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedRows.includes(row._id)}
                                                                readOnly
                                                            />
                                                        </td>
                                                        <td title={row.equipmentsType}>{row?.equipmentsType}</td>
                                                        <td title={row.totalCount}>{row?.totalCount}</td>

                                                        <td title={row.fulfillDate}>{row?.fulfillDate}</td>
                                                        <td title={row.station}>{row?.station}</td>
                                                        <td title={row.notes}>{row?.notes}</td>


                                                        <td>
                                                            <Link href={`/inventory/equipments/variants/${row._id}`}>
                                                                <span className=" text-[26px] text-mainBlue cursor-pointer">
                                                                    <IoArrowForward />
                                                                </span>
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="pagination-wrapper">
                            <div className="flex gap-5 justify-center items-center my-3">
                                <span className=" text-[#9A9A9A]  ">
                                    Showing {startingIndex == 0 ? 1 : startingIndex} to{" "}
                                    {currentPage * 10 > pageRows?.length
                                        ? pageRows?.length - 1
                                        : currentPage * 10}{" "}
                                    of {pageRows?.length} entries
                                </span>
                                <button onClick={() => handlePrevPagination()}>&lt;</button>
                                <div className="pages">
                                    <div className="bg-[#F0F3F5] py-1 px-4 rounded-lg">
                                        {currentPage}
                                    </div>
                                </div>
                                <button onClick={() => handleNextPagination()}>&gt;</button>
                            </div>
                        </div>
                    </div>
                    {/* Modal */}
                    <MyModal
                        setIsOpen={setIsOpen}
                        isOpen={isOpen}
                        title={modalTitle}
                        body={modalBody}
                        ifTrue={modalTrue}
                    />
                </div>
            )}
        </>
    );
}
